import React, {useCallback} from 'react';
import {store, useStore} from '../store';

const Counter = () => {
  const count = useStore(
    store,
    useCallback((state) => state.count, [])
  );

  const inc = () => {
    store.setState((prev) => ({...prev, count: prev.count + 1}));
  };

  return (
    <div>
      {count}
      <button onClick={inc}>+1</button>
    </div>
  );
};

export default Counter;
