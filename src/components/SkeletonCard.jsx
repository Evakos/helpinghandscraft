import './SkeletonCard.css';

const SkeletonCard = ({ type = 'product' }) => {
  if (type === 'category') {
    return (
      <div className="skeleton-card skeleton-card--category">
        <div className="skeleton-icon" />
        <div className="skeleton-text skeleton-text--short" />
      </div>
    );
  }

  return (
    <div className="skeleton-card skeleton-card--product">
      <div className="skeleton-image" />
      <div className="skeleton-text skeleton-text--long" />
      <div className="skeleton-text skeleton-text--medium" />
      <div className="skeleton-text skeleton-text--short" />
    </div>
  );
};

export default SkeletonCard;
