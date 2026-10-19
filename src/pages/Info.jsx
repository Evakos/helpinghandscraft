import { Link } from 'react-router-dom';
import { Heart, Truck, Mail, User } from 'lucide-react';
import './Info.css';

// One layout for the small pages (About, Delivery, Contact, Account). Only copy that is already true for the shop goes in here.
const InfoPage = ({ icon: Icon, tint, label, title, children }) => (
  <div className="info">
    <section className="info-hero">
      <span className={`info-icon info-icon--${tint}`}><Icon size={26} strokeWidth={1.6} /></span>
      <p className="info-label">{label}</p>
      <h1>{title}</h1>
    </section>
    <section className="info-body">{children}</section>
  </div>
);

export const About = () => (
  <InfoPage icon={Heart} tint="blush" label="About us" title="Made with care">
    <p>
      Every product in our collection is thoughtfully curated to inspire your next creation. From essential tools to unique
      embellishments, we believe in the beauty of handmade.
    </p>
    <p>
      Whether you're a seasoned maker or just beginning your creative journey, Helping Hands Craft is here to support you with
      quality supplies and a community that celebrates the art of making.
    </p>
    <Link to="/shop" className="btn btn--solid">Browse the shop</Link>
  </InfoPage>
);

export const Delivery = () => (
  <InfoPage icon={Truck} tint="sky" label="Delivery" title="Free UK delivery">
    <p>We offer free delivery to the UK on orders over £30.</p>
    <p>More delivery details will be added here when the shop reopens.</p>
    <Link to="/shop" className="btn btn--solid">Browse the shop</Link>
  </InfoPage>
);

export const Contact = () => (
  <InfoPage icon={Mail} tint="butter" label="Contact" title="Get in touch">
    <p>We're setting up our contact details while the shop is being restocked.</p>
    <p>In the meantime, leave your email in the newsletter box and we'll let you know the moment we're back.</p>
    <Link to={{ pathname: '/', hash: '#newsletter' }} className="btn btn--solid">Join the newsletter</Link>
  </InfoPage>
);

export const Account = () => (
  <InfoPage icon={User} tint="lilac" label="Account" title="Accounts are coming soon">
    <p>Sign in, order history and saved details will live here when the shop reopens.</p>
    <Link to="/shop" className="btn btn--solid">Browse the shop</Link>
  </InfoPage>
);

