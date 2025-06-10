import React, { useRef, useState } from 'react'
import { useChatStore } from '../store/useChatStore';
import { X, Send, Image } from 'lucide-react';
import toast from 'react-hot-toast';
const MessageInput = () => {

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  // Function to handle image selection
  const handleImageChange = (e) => {

    // Check if a file is selected
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      // If the file is not an image, show an error message
      toast.error("Please upload a valid image file.");
      return;

    }
    // If a valid image file is selected, create a preview
    const reader = new FileReader();

    // The FileReader API reads the file and converts it to a data URL
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    // Read the file as a data URL
    reader.readAsDataURL(file);
  }

  // Function to remove the selected image
  const removeImage = () => {
    setImagePreview(null);
    // Reset the file input to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Clear the file input
    }
  }

  // Function to handle sending messages
  const handleSendMessages = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) {
      return; // Prevent sending empty messages
    }
    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  return (
    <div className="p-4 w-full">
      {/* Input field for text messages */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSendMessages} className='flex items-center gap-2'>
        <div className="flex-1 flex gap-2">
          { /* Button to clear the input field */}
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          { /* Button to send the message */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          { /* Button to trigger file input for image upload */}
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
