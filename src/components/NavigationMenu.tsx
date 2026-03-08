import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";

const linkStyle: React.CSSProperties = {
    fontSize: "0.82rem",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "hsl(215,20%,50%)",
    textDecoration: "none",
    padding: "0.45rem 0.85rem",
    borderRadius: "5px",
    transition: "color 0.15s, background 0.15s",
    display: "inline-block",
};

const iconLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "0.45rem 0.55rem",
    borderRadius: "5px",
    transition: "background 0.15s",
};

const iconStyle: React.CSSProperties = {
    filter:
        "invert(100%) sepia(0%) saturate(0%) brightness(65%) contrast(100%)",
    transition: "filter 0.2s",
};

export const NavigationMenuComponent = () => (
    <NavigationMenu className="py-2">
        <NavigationMenuList className="gap-x-1">
            <NavigationMenuItem>
                <a href="/posts" style={linkStyle}>Posts</a>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <a href="/projects" style={linkStyle}>Projects</a>
            </NavigationMenuItem>

            {/* divider */}
            <NavigationMenuItem>
                <span style={{ display: "block", width: "1px", height: "18px", background: "hsl(217,33%,18%)", margin: "0 0.3rem" }} />
            </NavigationMenuItem>

            <NavigationMenuItem>
                <a href="https://github.com/timelesclock" target="_blank" rel="noreferrer" style={iconLinkStyle}>
                    <img src="/images/github-icon.svg" alt="GitHub" style={iconStyle} width={20} height={20} />
                </a>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <a href="https://www.linkedin.com/in/andy-leong-9bb486272/" target="_blank" rel="noreferrer" style={iconLinkStyle}>
                    <img src="/images/linkedin-icon.svg" alt="LinkedIn" style={iconStyle} width={20} height={20} />
                </a>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
);