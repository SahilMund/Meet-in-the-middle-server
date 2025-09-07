export const toMs = (str) => {
  if (typeof str !== "string") throw new Error("Input must be a string");

  const match = str.match(/^(\d+)([dhms])$/i);
  if (!match)
    throw new Error("Invalid time format. Use like '7d', '12h', '30m', '45s'");

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * units[unit];
};
