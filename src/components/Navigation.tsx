import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Bot } from 'lucide-react';

export function Navigation() {
    const location = useLocation();

    return (
        <nav className="flex items-center gap-2">
            <Link to="/">
                <Button
                    variant={location.pathname === '/' ? 'default' : 'outline'}
                    size="sm"
                    className={
                        location.pathname === '/'
                            ? 'neon-border bg-primary/20 hover:bg-primary/40 text-primary border-primary'
                            : 'border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50'
                    }
                >
                    <Home className="w-4 h-4 mr-2" />
                    主页
                </Button>
            </Link>
            <Link to="/agents">
                <Button
                    variant={location.pathname === '/agents' ? 'default' : 'outline'}
                    size="sm"
                    className={
                        location.pathname === '/agents'
                            ? 'neon-border bg-primary/20 hover:bg-primary/40 text-primary border-primary'
                            : 'border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50'
                    }
                >
                    <Bot className="w-4 h-4 mr-2" />
                    Agent管理
                </Button>
            </Link>
        </nav>
    );
}
