import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";

export const NavigationMenuComponent = () => {

    const socialIconStyle = {
        "fontSize": "2.5rem",
        "filter": "invert(100%) sepia(0%) saturate(0%) hue-rotate(327deg) brightness(109%) contrast(103%)",
        "transition": "filter 300ms",
        "cursor": "pointer",
    }
    return (
        <NavigationMenu className="py-2">
            <NavigationMenuList className="gap-x-2">
                <NavigationMenuItem>
                    <a href="/posts" className="text-muted-foreground hover:text-foreground">
                        Posts
                    </a>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <a href="/projects" className="text-muted-foreground hover:text-foreground">
                        Projects
                    </a>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <a
                        href="https://github.com/timelesclock"
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <img
                            src="/images/github-icon.svg"
                            alt="GitHub Icon"
                            style={socialIconStyle}
                            className="w-6 h-6"
                        />
                    </a>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <a
                        href="https://www.linkedin.com/in/andy-leong-9bb486272/"
                        target="_blank"
                        rel="noreferrer"
                        className=" text-muted-foreground hover:text-foreground"
                    >
                        <img
                            src="/images/linkedin-icon.svg"
                            alt="LinkedIn Icon"
                            style={socialIconStyle}
                            className="w-6 h-6"
                        />
                    </a>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu >
    )
}

