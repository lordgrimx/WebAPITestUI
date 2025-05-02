"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth-context";
import { authAxios } from "@/lib/auth-context";
import { toast } from "sonner";

export default function EnvironmentModal({
  open,
  setOpen,
  environment = null,
  onEnvironmentSaved = () => {},
}) {
  // Import authAxios directly rather than trying to destructure it from useAuth()
  // since it's exported directly from auth-context.js
  const { user } = useAuth();
  const isEditing = !!environment?.id;
  const [formData, setFormData] = useState({
    name: environment?.name || "",
    // variables: environment?.variables || {}, // Variables state'ini kaldır
    isActive: environment?.isActive || false
  });

  // Variables ile ilgili state ve fonksiyonları kaldır
  // const [keyValuePairs, setKeyValuePairs] = useState(
  //   Object.entries(formData.variables).map(([key, value]) => ({ key, value })) || 
  //   [{ key: "", value: "" }]
  // );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (checked) => {
    setFormData({ ...formData, isActive: checked });
  };

  // Variables ile ilgili fonksiyonları kaldır
  // const addKeyValuePair = () => { ... };
  // const removeKeyValuePair = (index) => { ... };
  // const handleKeyValueChange = (index, field, value) => { ... };

  const handleSubmit = async () => {
    try {
      // Variables oluşturma kısmını kaldır
      // const variables = {};
      // keyValuePairs.forEach(({ key, value }) => { ... });

      const payload = {
        name: formData.name,
        variables: {}, // Boş bir variables nesnesi ekle
        isActive: formData.isActive
      };

      let response;
      if (isEditing) {
        response = await authAxios.put(`/environments/${environment.id}`, payload);
        toast.success("Environment updated successfully");
      } else {
        response = await authAxios.post("/environments", payload);
        toast.success("Environment created successfully");
      }

      onEnvironmentSaved(response.data);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save environment:", error);
      toast.error(
        isEditing 
          ? "Failed to update environment" 
          : "Failed to create environment", 
        { 
          description: error.response?.data?.message || "An unexpected error occurred" 
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Environment" : "Add New Environment"}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update environment name and variables below."
              : "Create a new environment with your variables."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Environment name"
              className="col-span-3"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          
          {/* Variables ile ilgili JSX'i kaldır */}
          {/* <div className="grid grid-cols-4 items-center gap-4 mt-2"> ... </div> */}
          {/* {keyValuePairs.map((pair, index) => ( ... ))} */}
          {/* <Button ...> Add Variable </Button> */}
          
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox 
              id="isActive" 
              checked={formData.isActive} 
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="isActive">Set as active environment</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
