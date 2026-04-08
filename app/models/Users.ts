type User = {
  id: number;
  name: string;
  surname?: string;
  email: string;
  contactNumber: string;
  poi: boolean;
};

let users: User[] = [];
let nextId = 1;

export function addUser(data: Omit<User, "id" | "poi">) {
  const user: User = { id: nextId++, ...data, poi: true };
  users.push(user);
  // For now we keep data in memory. Later this can be persisted to DB or CSV.
  console.log("Added user (POI):", user);
  return user;
}

export function getUsers() {
  return users.slice();
}
