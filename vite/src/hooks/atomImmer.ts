import produce from "immer";
import { isFunction } from "lodash";
import { RecoilState, SetterOrUpdater, useRecoilState } from "recoil";

// const useRecoilImmerState = useRecoilState()
export function useRecoilImmerState<T>(
  recoilState: RecoilState<T>
): [T, SetterOrUpdater<T>] {
  const [value, setValue] = useRecoilState(recoilState);
  const setterFunction: SetterOrUpdater<T> = (valOrUpdater) => {
    if (isFunction(valOrUpdater)) {
      setValue(produce(valOrUpdater) as any);
      return;
    }

    setValue(valOrUpdater);
    return;
  };

  return [value, setterFunction];
}
