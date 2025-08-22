import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const quickReplies = [
  {
    id: 1,
    title: "Welcome Message",
    content: "¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte hoy?",
    category: "greetings",
    usage: 45
  },
  {
    id: 2,
    title: "Working Hours",
    content: "Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Te responderemos lo antes posible.",
    category: "info",
    usage: 32
  },
  {
    id: 3,
    title: "Thank You",
    content: "¡Gracias por tu mensaje! Hemos recibido tu consulta y te responderemos pronto.",
    category: "greetings",
    usage: 28
  },
  {
    id: 4,
    title: "Pricing Info",
    content: "Te envío información sobre nuestros precios. ¿Hay algún servicio específico que te interese?",
    category: "sales",
    usage: 23
  },
  {
    id: 5,
    title: "Follow Up",
    content: "Hola, quería hacer seguimiento a tu consulta anterior. ¿Has tenido oportunidad de revisar nuestra propuesta?",
    category: "follow-up",
    usage: 19
  }
];

const categories = ["greetings", "info", "sales", "follow-up", "support"];

const QuickReplies = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newReply, setNewReply] = useState({ title: "", content: "", category: "greetings" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredReplies = selectedCategory === "all" 
    ? quickReplies 
    : quickReplies.filter(reply => reply.category === selectedCategory);

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Quick reply copied to clipboard",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      greetings: "bg-green-100 text-green-800",
      info: "bg-blue-100 text-blue-800",
      sales: "bg-purple-100 text-purple-800",
      "follow-up": "bg-yellow-100 text-yellow-800",
      support: "bg-red-100 text-red-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quick Replies</h1>
          <p className="text-muted-foreground">
            Manage your quick reply templates for faster communication.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Quick Reply
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Quick Reply</DialogTitle>
              <DialogDescription>
                Add a new quick reply template to speed up your conversations.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReply.title}
                  onChange={(e) => setNewReply({...newReply, title: e.target.value})}
                  placeholder="Enter title..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newReply.category}
                  onChange={(e) => setNewReply({...newReply, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newReply.content}
                  onChange={(e) => setNewReply({...newReply, content: e.target.value})}
                  placeholder="Enter your quick reply message..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log("Creating quick reply:", newReply);
                setIsDialogOpen(false);
                setNewReply({ title: "", content: "", category: "greetings" });
                toast({
                  title: "Success",
                  description: "Quick reply created successfully",
                });
              }}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All ({quickReplies.length})
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({quickReplies.filter(r => r.category === category).length})
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{quickReplies.length}</div>
            <div className="text-sm text-muted-foreground">Total Templates</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {quickReplies.reduce((sum, reply) => sum + reply.usage, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Usage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {Math.round(quickReplies.reduce((sum, reply) => sum + reply.usage, 0) / quickReplies.length)}
            </div>
            <div className="text-sm text-muted-foreground">Avg. Usage</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Replies List */}
      <div className="grid gap-4">
        {filteredReplies.map((reply) => (
          <Card key={reply.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{reply.title}</CardTitle>
                  <Badge variant="secondary" className={getCategoryColor(reply.category)}>
                    {reply.category}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    Used {reply.usage} times
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyToClipboard(reply.content)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{reply.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;