import { Ref, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from 'react-query';

import { fetchProducts } from '../api/fetchProducts';

export const useProducts = (observerElem: any) => {
  const { data, isError, hasNextPage, fetchNextPage } = useInfiniteQuery(
    ['products'],
    ({ pageParam = 0 }) => fetchProducts(pageParam),
    {
      //getting parameters for the next fetch call,
      // in this case we need to increase the skip param by 10 every time
      //we request data
      getNextPageParam: (lastPage, allPages) => {
        const nextPage = lastPage.skip + 10;
        return lastPage.skip !== 100 ? nextPage : undefined;
      },
    },
  );

  const handleObserver = useCallback(
    (entries: any) => {
      const [target] = entries;
      //on intersection call the fetch funtcion
      if (target.isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage],
  );

  //detecting intersection with the passed ref prop and calling the handler function
  useEffect(() => {
    const element: any = observerElem.current;
    const option = { threshold: 0 };

    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [fetchNextPage, hasNextPage, handleObserver]);

  return { data, isError };
};
