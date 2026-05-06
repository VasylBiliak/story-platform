export type User = {
  name: string;
  email: string;
};

export function logAuthAction(action: string, data: Record<string, unknown>) {
  console.log({
    type: action,
    ...data,
  });
}
