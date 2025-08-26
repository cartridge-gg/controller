const crossFetch = typeof fetch !== "undefined" ? fetch : undefined;
export default crossFetch;
export { crossFetch as fetch };
