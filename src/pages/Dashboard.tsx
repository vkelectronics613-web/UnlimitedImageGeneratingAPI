import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Key, Plus, Copy, Trash2, Eye, EyeOff, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  id: string;
  key: string;
  name: string;
  images_used: number;
  images_limit: number;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

const Dashboard = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [showDocs, setShowDocs] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchKeys();
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchKeys = async () => {
    const { data, error } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    if (!error && data) setApiKeys(data);
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast({ title: "Enter a name for your API key", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("api_keys").insert({ user_id: user.id, name: newKeyName.trim() });
    if (error) {
      toast({ title: "Failed to create key", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "API key created!" });
      setNewKeyName("");
      fetchKeys();
    }
    setCreating(false);
  };

  const deleteKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").delete().eq("id", id);
    if (!error) {
      toast({ title: "API key deleted" });
      fetchKeys();
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to clipboard!" });
  };

  const toggleVisible = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-generate-image`;

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
        <header className="border-b border-border px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-gradient">ImageForge</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDocs(!showDocs)}>
                <BookOpen className="h-4 w-4 mr-2" />
                API Docs
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* API Docs */}
          {showDocs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-card border border-border rounded-xl p-6 space-y-4"
            >
              <h2 className="text-xl font-bold">API Documentation</h2>
              <p className="text-muted-foreground text-sm">
                Generate images by sending a POST request with your API key.
              </p>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">{`curl -X POST "${baseUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "YOUR_API_KEY",
    "prompt": "A sunset over mountains"
  }'`}</pre>
              </div>
              <h3 className="font-semibold mt-4">Response</h3>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-foreground">{`{
  "imageUrl": "https://...public-url...",
  "prompt": "A sunset over mountains",
  "usage": {
    "images_used": 1,
    "images_limit": 50
  }
}`}</pre>
              </div>
              <h3 className="font-semibold">Rate Limits</h3>
              <p className="text-sm text-muted-foreground">Each API key can generate up to <strong className="text-foreground">50 images</strong>. Usage is tracked per key.</p>
              <h3 className="font-semibold">Error Codes</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><code className="text-primary">401</code> — Invalid or missing API key</p>
                <p><code className="text-primary">403</code> — API key deactivated</p>
                <p><code className="text-primary">429</code> — Image limit reached (50/50)</p>
                <p><code className="text-primary">500</code> — Server error</p>
              </div>
            </motion.div>
          )}

          {/* Create Key */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Create API Key
            </h2>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="keyName" className="sr-only">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name (e.g. My App)"
                  maxLength={50}
                />
              </div>
              <Button onClick={createKey} disabled={creating}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </motion.div>

          {/* Keys List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Your API Keys</h2>
            {apiKeys.length === 0 && (
              <p className="text-muted-foreground text-sm">No API keys yet. Create one above to get started.</p>
            )}
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{key.name}</h3>
                    <Badge variant={key.is_active ? "default" : "destructive"}>
                      {key.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteKey(key.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-secondary px-3 py-2 rounded-lg text-sm font-mono truncate">
                    {visibleKeys.has(key.id) ? key.key : key.key.slice(0, 8) + "••••••••••••••••"}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => toggleVisible(key.id)}>
                    {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyKey(key.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usage</span>
                    <span className="font-mono">{key.images_used} / {key.images_limit}</span>
                  </div>
                  <Progress value={(key.images_used / key.images_limit) * 100} className="h-2" />
                </div>

                <p className="text-xs text-muted-foreground">
                  Created {new Date(key.created_at).toLocaleDateString()}
                  {key.last_used_at && ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                </p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
