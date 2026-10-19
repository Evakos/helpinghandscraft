"""Recovers the old Helping Hands Craft catalogue from the Wayback Machine.
Run from this folder: python3 wayback.py. It is slow on purpose (the archive rate limits), resumes where it stopped, and writes
products-wayback.json (name, price, description, image link, categories, snapshot date) and products-missed.json.
Fetches only public archived pages. Late 2025 snapshots are SiteGround bot challenge pages and are skipped automatically."""
import json,re,time,urllib.request,urllib.error,html,sys
import os
OUT=os.path.dirname(os.path.abspath(__file__))  # run from helping-hands-craft/catalogue/
UA={"User-Agent":"Mozilla/5.0 (evakos catalogue recovery; contact info@evakos.io)"}
def get(url,tries=5,timeout=60):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=timeout).read().decode("utf-8","replace")
        except urllib.error.HTTPError as e:
            if e.code in (429,503): time.sleep(20*(i+1)); continue
            if e.code in (404,403): return None
            time.sleep(5)
        except Exception: time.sleep(5)
    return None
# 1. every archived product URL
import os
if os.path.exists(OUT+"/product-urls.json"):
    urls=json.load(open(OUT+"/product-urls.json"))
else:
    cdx=get("http://web.archive.org/cdx/search/cdx?url=helpinghandscraft.co.uk/product/*&output=json&fl=timestamp,original,statuscode&filter=statuscode:200&collapse=urlkey&limit=5000")
    rows=json.loads(cdx)[1:]
    urls=sorted({re.sub(r"[?#].*","",r[1]).replace("http://","https://") for r in rows})
    urls=[u for u in urls if re.search(r"/product/[^/]+/?$",u)]
print(len(urls),"product URLs",flush=True)
json.dump(urls,open(OUT+"/product-urls.json","w"),indent=1)
# 2. fetch nearest-to-2025 snapshot of each, parse JSON-LD
def parse(htmltext,url,ts):
    p={"url":url,"snapshot":ts}
    for m in re.finditer(r'<script type="application/ld\+json"[^>]*>(.*?)</script>',htmltext,re.S):
        try: d=json.loads(m.group(1))
        except Exception: continue
        graph=d.get("@graph",[d]) if isinstance(d,dict) else d
        for n in (graph if isinstance(graph,list) else [graph]):
            if isinstance(n,dict) and n.get("@type")=="Product":
                p["name"]=html.unescape(n.get("name",""))
                p["sku"]=n.get("sku")
                p["description"]=html.unescape(re.sub(r"<[^>]+>"," ",n.get("description","") or "")).strip()
                img=n.get("image")
                if isinstance(img,list): img=img[0] if img else None
                if isinstance(img,dict): img=img.get("url") or img.get("contentUrl")
                p["image"]=img
                off=n.get("offers"); off=off[0] if isinstance(off,list) and off else off
                if isinstance(off,dict):
                    ps=off.get("priceSpecification"); ps=ps[0] if isinstance(ps,list) and ps else (ps or {})
                    p["price"]=off.get("price") or (ps.get("price") if isinstance(ps,dict) else None)
                    p["currency"]=off.get("priceCurrency"); p["availability"]=off.get("availability")
    if "name" not in p:
        t=re.search(r'<h1[^>]*product_title[^>]*>(.*?)</h1>',htmltext,re.S) or re.search(r'<title>(.*?)</title>',htmltext,re.S)
        if t: p["name"]=html.unescape(re.sub(r"<[^>]+>","",t.group(1))).strip()
        og=re.search(r'property="og:image" content="([^"]+)"',htmltext)
        if og: p["image"]=og.group(1)
        pr=re.search(r'woocommerce-Price-amount[^>]*>.*?(\d+[.,]\d{2})',htmltext,re.S)
        if pr: p["price"]=pr.group(1)
    cats=re.findall(r'/product-category/([a-z0-9-/]+?)/?"',htmltext)
    p["categories"]=sorted(set(c.split("/")[-1] for c in cats))[:6]
    return p
# Resume: keep what is already saved and skip those pages.
res=json.load(open(OUT+"/products-wayback.json")) if os.path.exists(OUT+"/products-wayback.json") else []
done={x["url"] for x in res}
miss=[]
for i,u in enumerate(urls):
    if u in done: continue
    got=None
    for ts in ("20250301","20241001","20240401","20231001","20230401","20221001","20220401","20210601"):
        t=get(f"https://web.archive.org/web/{ts}id_/{u}",tries=3)
        if t and "One moment, please" not in t[:3000] and ("product_title" in t or '"@type":"Product"' in t or "og:type" in t and "product" in t.lower()[:20000]):
            got=parse(t,u,ts); break
        time.sleep(1)
    if got and got.get("name"): res.append(got)
    else: miss.append(u)
    if i%10==0: print(i,len(res),len(miss),flush=True)
    if i%40==0: json.dump(res,open(OUT+"/products-wayback.json","w"),indent=1,ensure_ascii=False)
    time.sleep(1.2)
json.dump(res,open(OUT+"/products-wayback.json","w"),indent=1,ensure_ascii=False)
json.dump(miss,open(OUT+"/products-missed.json","w"),indent=1)
print("DONE",len(res),"parsed",len(miss),"missed",flush=True)
