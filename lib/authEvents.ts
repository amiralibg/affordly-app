// Simple event emitter for auth events
type AuthEventListener = () => void;

class AuthEvents {
  private listeners: AuthEventListener[] = [];

  onAuthFailure(listener: AuthEventListener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emitAuthFailure() {
    this.listeners.forEach((listener) => listener());
  }
}

export const authEvents = new AuthEvents();
