interface InputFieldProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const InputField = ({ label, type, name, value, onChange, placeholder, icon: Icon }: InputFieldProps) => (  
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-900">
            {label}
        </label>
        <div className="mt-2 relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                id={name}
                placeholder={placeholder}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
            />
            {Icon && (
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            )}
        </div>
    </div>
);

export default InputField;