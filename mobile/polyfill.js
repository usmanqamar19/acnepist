// Polyfill for Array.prototype.toReversed() for Node.js 18 compatibility
if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

