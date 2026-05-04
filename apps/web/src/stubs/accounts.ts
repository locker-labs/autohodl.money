// Stub for optional @wagmi/core peer dependency (accounts ~0.8.1).
// @wagmi/core@3.4.x dynamically imports this for the experimental Tempo connector.
// Since we don't use Tempo, this stub satisfies the Turbopack static resolver
// while the runtime .catch() in wagmi handles the missing module gracefully.
export default {};
