// Returns an inline style object with an animation-delay based on index,
// so list items fade in one after another instead of all at once.
export const staggerStyle = (index, baseDelay = 0.06) => ({
  animationDelay: `${index * baseDelay}s`,
});