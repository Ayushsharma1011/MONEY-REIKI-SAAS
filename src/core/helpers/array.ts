export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function chunk<T>(values: T[], size: number): T[][] {
  if (size <= 0) {
    return [];
  }

  const result: T[][] = [];

  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }

  return result;
}

export function groupBy<T, K extends string | number>(
  values: T[],
  getKey: (value: T) => K
): Record<K, T[]> {
  return values.reduce(
    (groups, value) => {
      const key = getKey(value);
      groups[key] = groups[key] ? [...groups[key], value] : [value];
      return groups;
    },
    {} as Record<K, T[]>
  );
}

export function sortBy<T>(
  values: T[],
  getValue: (value: T) => string | number
): T[] {
  return [...values].sort((left, right) => {
    const leftValue = getValue(left);
    const rightValue = getValue(right);

    if (leftValue < rightValue) {
      return -1;
    }

    if (leftValue > rightValue) {
      return 1;
    }

    return 0;
  });
}

export function first<T>(values: T[]): T | undefined {
  return values[0];
}

export function last<T>(values: T[]): T | undefined {
  return values[values.length - 1];
}
