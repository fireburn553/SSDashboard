interface ButtonProps {
  children: React.ReactNode;
  size?: number;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark";
  onClick: () => void;
}

function Button({ children, color, onClick, size }: ButtonProps) {
  return (
    <button
      className={"btn btn-" + color + " w-" + size + " mt-3"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
