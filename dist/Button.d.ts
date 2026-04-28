export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'accent' | 'primary';
    size?: 'sm' | 'md';
    disabled?: boolean;
    type?: 'button' | 'submit';
}
export declare function Button({ children, onClick, variant, size, disabled, type }: ButtonProps): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=Button.d.ts.map