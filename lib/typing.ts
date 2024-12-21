type WithAge<T> = T & { age: number };

export function attachLog<T>(item: T, age: number): WithAge<T> {
  return { ...item, age };
}

export function consumeAge<T>(item: WithAge<T>): Omit<T, "age"> {
  const { age, ...rest } = item;
  console.log(`age: ${age}`);
  return rest;
}

const a = {
  name: "test",
  age: "thirty",
};

const aa = attachLog(a, 30);

const aaa = consumeAge(aa);
