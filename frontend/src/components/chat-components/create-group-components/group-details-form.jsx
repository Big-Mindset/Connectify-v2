"use client"

import { useLoading } from "@/lib/loading_hook";
import { Camera, ImageOff, Loader } from "lucide-react";
import { useState, useRef } from "react";

export default function GroupDetailsForm({ participantIds, onBack, onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState("");
    const {loading , setLoading} = useLoading()
    const fileInputRef = useRef(null);

    function handleImageChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            return;
        }

        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    function handleRemoveImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Group name is required");
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim() || null,
            media: imageFile || null, 
            participantIds,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
            
            <div className="flex flex-col items-center gap-2">
                <div className="relative size-28 group">
                    <label
                        htmlFor="group-dp"
                        className="size-28 flex items-center justify-center rounded-full bg-gray-800 border-2 border-dashed border-gray-600 group-hover:border-indigo-400 cursor-pointer overflow-hidden duration-200 relative"
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Group preview"
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-gray-400">
                                <Camera className="size-6" />
                                <span className="text-xs">Add photo</span>
                            </div>
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 duration-200 flex items-center justify-center">
                            <Camera className="size-5 text-white" />
                        </div>
                    </label>

                    {imagePreview && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 size-6 rounded-full bg-gray-700 hover:bg-red-600 duration-150 flex items-center justify-center cursor-pointer ring-2 ring-gray-2"
                        >
                            <ImageOff className="size-3.5" />
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="group-dp"
                    />
                </div>
                <span className="text-xs text-gray-400">Group photo (optional)</span>
            </div>

            <div className="flex flex-col w-full gap-1.5">
                <label className="text-sm font-semibold text-gray-200" htmlFor="group-name">
                    Name <span className="text-red-400">*</span>
                </label>
                <input
                    type="text"
                    id="group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Weekend Trip"
                    maxLength={50}
                    className="outline-none bg-gray-900/60 text-gray-100 placeholder:text-gray-500 ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500 hover:ring-gray-600 duration-150 rounded-full py-2.5 px-4"
                />
            </div>

            <div className="flex flex-col w-full gap-1.5">
                <label className="text-sm font-semibold text-gray-200" htmlFor="group-description">
                    Description <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                    id="group-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this group about?"
                    rows={3}
                    maxLength={200}
                    className="outline-none bg-gray-900/60 text-gray-100 placeholder:text-gray-500 ring-1 ring-gray-700 focus:ring-2 focus:ring-indigo-500 hover:ring-gray-600 duration-150 rounded-lg py-2.5 px-4 resize-none"
                />
            </div>

            {error && <p className="text-sm text-red-400 -mt-1">{error}</p>}

            <div className="grid grid-cols-2 gap-2.5 mt-1">
                <button
                    type="button"
                    onClick={onBack}
                    className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 duration-150 cursor-pointer rounded-full"
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium duration-150 cursor-pointer rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!name.trim() || loading === "creating-group"}
                >
                    {loading === "creating-group" ? <Loader className="mx-auto animate-spin text-gray-200" /> : 
                    "Create Group"}
                </button>
            </div>
        </form>
    );
}
