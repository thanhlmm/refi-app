import produce from "immer";
import { isFunction } from "lodash";
import React from "react";
import {
  Loadable,
  RecoilState,
  RecoilValue,
  Snapshot,
  useGotoRecoilSnapshot,
  useRecoilCallback,
  useRecoilTransactionObserver_UNSTABLE,
} from "recoil";

/**
 * Returns a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.

 * <RecoilExternalStatePortal> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when RecoilExternalStatePortal is loaded.
 *
 * @example const lastCreatedUser = getRecoilExternalLoadable(lastCreatedUserState);
 */
export let getRecoilExternalLoadable: <T>(
  recoilValue: RecoilValue<T>
) => Loadable<T> = () => null as any;

/**
 * Sets a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.
 *
 * <RecoilExternalStatePortal> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when RecoilExternalStatePortal is loaded.
 *
 * @example setRecoilExternalState(lastCreatedUserState, newUser)
 */
export let setRecoilExternalState: <T>(
  recoilState: RecoilState<T>,
  valOrUpdater: ((currVal: T) => T) | T
) => void = () => null as any;

/**
 * Sets a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.
 *
 * <RecoilExternalStatePortal> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when RecoilExternalStatePortal is loaded.
 *
 * @example setRecoilExternalStateImmer(lastCreatedUserState, newUser)
 */
export const setRecoilExternalStateImmer: <T>(
  recoilState: RecoilState<T>,
  valOrUpdater: ((currVal: T) => T) | T
) => void = (recoilState, valOrUpdater) => {
  if (isFunction(valOrUpdater)) {
    setRecoilExternalState(recoilState, produce(valOrUpdater as any));
    return;
  }

  setRecoilExternalState(recoilState, valOrUpdater);
  return;
};

/**
 * Resets a Recoil state value, from anywhere in the app.
 *
 * Can be used outside of the React tree (outside a React component), such as in utility scripts, etc.
 *
 * <RecoilExternalStatePortal> must have been previously loaded in the React tree, or it won't work.
 * Initialized as a dummy function "() => null", it's reference is updated to a proper Recoil state mutator when RecoilExternalStatePortal is loaded.
 *
 * @example resetRecoilExternalState(lastCreatedUserState, newUser)
 */
export let resetRecoilExternalState: <T>(
  recoilState: RecoilState<T>
) => void = () => null as any;

let currentSnapshot: Snapshot;
let gotoSnapshot: (snapshot: Snapshot) => void;
export interface IRecoilUpdateCommand<T = any> {
  atom: RecoilState<T>;
  valOrUpdater: ((currVal: T) => T) | T;
}

export const setRecoilBatchUpdate: (
  listUpdate: IRecoilUpdateCommand<any>[]
) => void = (listUpdate) => {
  if (currentSnapshot) {
    const newSnapshot = currentSnapshot.map(({ set }) => {
      listUpdate.forEach(({ atom, valOrUpdater }) => {
        set(atom, valOrUpdater);
      });

      // Test
      // set(isModalCommandAtom, true);
    });

    gotoSnapshot(newSnapshot);
  }
};

/**
 * Utility component allowing to use the Recoil state outside of a React component.
 *
 * It must be loaded in the _app file, inside the <RecoilRoot> component.
 * Once it's been loaded in the React tree, it allows using setRecoilExternalState and getRecoilExternalLoadable from anywhere in the app.
 *
 * @see https://github.com/facebookexperimental/Recoil/issues/289#issuecomment-777300212
 * @see https://github.com/facebookexperimental/Recoil/issues/289#issuecomment-777305884
 * @see https://recoiljs.org/docs/api-reference/core/Loadable/
 */
export function RecoilExternalStatePortal() {
  // We need to update the getRecoilExternalLoadable every time there's a new snapshot
  // Otherwise we will load old values from when the component was mounted
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    getRecoilExternalLoadable = snapshot.getLoadable;
    currentSnapshot = snapshot;
  });

  gotoSnapshot = useGotoRecoilSnapshot();

  // We only need to assign setRecoilExternalState once because it's not temporally dependent like "get" is
  useRecoilCallback(({ set, reset }) => {
    setRecoilExternalState = set;
    resetRecoilExternalState = reset;

    return () => {};
  }, [])();

  return <></>;
}
