export function useDayjs() {
  const { $dayjs } = useNuxtApp()
  return $dayjs as (input?: any) => any
}
