export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  size?: string | null;
  color?: string | null;
};

export type CartSnapshot = {
  items: CartItem[];
  updatedAt: number;
};

type CartListener = (snapshot: CartSnapshot) => void;

const STORAGE_KEY = "claroche.cart";
const listeners = new Set<CartListener>();
let inMemoryCart: CartSnapshot | null = null;

function getDefaultCart(): CartSnapshot {
  return { items: [], updatedAt: Date.now() };
}

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readCart(): CartSnapshot {
  const storage = getStorage();

  if (!storage) {
    if (!inMemoryCart) {
      inMemoryCart = getDefaultCart();
    }
    return { ...inMemoryCart, items: [...inMemoryCart.items] };
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultCart();
    }

    const parsed = JSON.parse(raw) as CartSnapshot;
    if (!parsed?.items) {
      return getDefaultCart();
    }

    return { ...parsed, items: [...parsed.items] };
  } catch {
    return getDefaultCart();
  }
}

function persistCart(cart: CartSnapshot) {
  const storage = getStorage();
  const payload = JSON.stringify(cart);

  if (!storage) {
    inMemoryCart = cart;
    return;
  }

  storage.setItem(STORAGE_KEY, payload);
}

function notify(cart: CartSnapshot) {
  for (const listener of listeners) {
    listener(cart);
  }
}

export function subscribe(listener: CartListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addItem(item: CartItem) {
  const cart = readCart();
  const index = cart.items.findIndex(
    (existing) =>
      existing.productId === item.productId && existing.variantId === item.variantId,
  );

  if (index >= 0) {
    cart.items[index] = {
      ...cart.items[index],
      quantity: cart.items[index].quantity + item.quantity,
      price: item.price,
      name: item.name,
      imageUrl: item.imageUrl ?? cart.items[index].imageUrl,
      size: item.size ?? cart.items[index].size,
      color: item.color ?? cart.items[index].color,
    };
  } else {
    cart.items.push(item);
  }

  cart.updatedAt = Date.now();
  persistCart(cart);
  notify(cart);
}

export function setItemQuantity(productId: string, variantId: string, quantity: number) {
  const cart = readCart();
  cart.items = cart.items
    .map((item) =>
      item.productId === productId && item.variantId === variantId
        ? { ...item, quantity }
        : item,
    )
    .filter((item) => item.quantity > 0);

  cart.updatedAt = Date.now();
  persistCart(cart);
  notify(cart);
}

export function removeItem(productId: string, variantId: string) {
  const cart = readCart();
  cart.items = cart.items.filter(
    (item) => !(item.productId === productId && item.variantId === variantId),
  );
  cart.updatedAt = Date.now();

  persistCart(cart);
  notify(cart);
}

export function clearCart() {
  const cart = getDefaultCart();
  persistCart(cart);
  notify(cart);
}

export function lineTotal(item: CartItem): number {
  return item.price * item.quantity;
}

export function cartTotals(cart: CartSnapshot): { subtotal: number; itemCount: number } {
  return cart.items.reduce(
    (acc, item) => {
      acc.subtotal += lineTotal(item);
      acc.itemCount += item.quantity;
      return acc;
    },
    { subtotal: 0, itemCount: 0 },
  );
}
