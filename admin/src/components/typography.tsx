export function Header1({ children }: {
    children: string;
}) {
    return (
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-5xl">
            {children}
        </h1>
    )
}

export function Header2({ children }: {
    children: string;
}) {
    return (
        <h2 className="scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
            {children}
        </h2>
    )
}

export function Header3({ children }: {
    children: string;
}) {
    return (
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {children}
        </h3>
    )
}

export function Header4({ children }: {
    children: string;
}) {
    return (
        <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
            {children}
        </h4>
    )
}


export function Paragraph({ children }: {
    children: string;
}) {
    return (
        <p className="leading-5">
            {children}
        </p>
    )
}

export function Large({ children }: {
    children: string;
}) {
    return <div className="text-lg font-semibold">
        {children}
    </div>
}

export function Small({ children }: {
    children: string;
}) {
    return (
        <small className = "text-sm font-medium leading-none" >
            { children }
      </small>
    )
}