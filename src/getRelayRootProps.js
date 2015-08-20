export default function getRelayRootProps(props) {
  const {
    forceFetch,
    renderLoading,
    renderFetched,
    renderFailure,
    onReadyStateChange
  } = props;
  return {
    forceFetch,
    renderLoading,
    renderFetched,
    renderFailure,
    onReadyStateChange
  };
}
