import useSwr from "swr";
import fetcher from "../lib/fetcher";

const useSubscription = (email: string) => {
  const { data, isLoading, error, mutate } = useSwr(
    `/api/stripe/subscription?email=${email}`,
    fetcher
  );
  return { plan: data, isLoading, error, mutate };
};

export default useSubscription;
