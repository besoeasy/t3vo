 export function useInfiniteScroll(loadMoreFunction) {
  const observer = new IntersectionObserver(
    (entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        loadMoreFunction();
      }
    },
    {
      rootMargin: "100px",
      threshold: 0.1,
    }
  );

  const observeElement = (element) => {
    if (element) {
      observer.observe(element);
    }
  };

  const unobserveElement = (element) => {
    if (element) {
      observer.unobserve(element);
    }
  };

  return {
    observeElement,
    unobserveElement,
  };
}
