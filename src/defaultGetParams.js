export default function defaultGetParams({params, query}) {
  return {...params, ...query};
}
