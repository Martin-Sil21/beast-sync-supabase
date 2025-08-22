import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Mail, Phone, MessageCircle } from "lucide-react";

const contacts = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 234 567 8900",
    company: "Acme Corp",
    tags: ["lead", "whatsapp"],
    avatar: "",
    lastContact: "2 days ago"
  },
  {
    id: 2,
    name: "Sarah Wilson",
    email: "sarah@techstart.com",
    phone: "+1 234 567 8901",
    company: "TechStart Inc",
    tags: ["customer", "instagram"],
    avatar: "",
    lastContact: "1 week ago"
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@global.com",
    phone: "+1 234 567 8902",
    company: "Global Solutions",
    tags: ["prospect", "facebook"],
    avatar: "",
    lastContact: "3 days ago"
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily@innovation.com",
    phone: "+1 234 567 8903",
    company: "Innovation Labs",
    tags: ["lead", "email"],
    avatar: "",
    lastContact: "1 day ago"
  }
];

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      lead: "bg-blue-100 text-blue-800",
      customer: "bg-green-100 text-green-800",
      prospect: "bg-yellow-100 text-yellow-800",
      whatsapp: "bg-green-100 text-green-800",
      instagram: "bg-pink-100 text-pink-800",
      facebook: "bg-blue-100 text-blue-800",
      email: "bg-gray-100 text-gray-800"
    };
    return colors[tag] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts and customer relationships.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{contacts.length}</div>
            <div className="text-sm text-muted-foreground">Total Contacts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.tags.includes("lead")).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.tags.includes("customer")).length}
            </div>
            <div className="text-sm text-muted-foreground">Customers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.tags.includes("whatsapp")).length}
            </div>
            <div className="text-sm text-muted-foreground">WhatsApp Contacts</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.phone}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className={getTagColor(tag)}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Last contact: {contact.lastContact}
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Contacts;