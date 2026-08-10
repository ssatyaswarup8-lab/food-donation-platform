const Skeleton = ({ height = 20, width = "100%", borderRadius = 6, style = {} }) => {
  return (
    <div
      style={{
        height,
        width,
        borderRadius,
        background: "linear-gradient(90deg, #eef7ee 25%, #f7fbf7 50%, #eef7ee 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-loading 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="card" style={{ marginBottom: 12 }}>
    <Skeleton height={20} width="60%" style={{ marginBottom: 10 }} />
    <Skeleton height={120} width="100%" style={{ marginBottom: 10 }} />
    <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
    <Skeleton height={14} width="40%" />
  </div>
);

export default Skeleton;