// export const debounce = <F extends (...args: any[]) => any>(
//   func: F,
//   waitFor: number
// ) => {
//   let timeout: ReturnType<typeof setTimeout> | null = null;

//   return (...args: Parameters<F>): Promise<ReturnType<F>> =>
//     new Promise(resolve => {
//       if (timeout) {
//         clearTimeout(timeout);
//       }

//       timeout = setTimeout(() => resolve(func(...args)), waitFor);
//     });
// };





export const debounce = <Args extends unknown[], R>(
  func: (...args: Args) => R,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Args): Promise<R> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
};