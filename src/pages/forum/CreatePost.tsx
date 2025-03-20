import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import ReactQuill from "react-quill";
import "../../styles/quill.snow.css";
import { Hymn, HymnWithRelations } from "../../types";
import { Music, Send, AlertTriangle } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import AlertBanner from "../../components/AlertBanner";
import LoadingIndicator from "../../components/LoadingIndicator";
import { useAuth } from "../../contexts/AuthContext";

const CreatePost = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedHymnId, setSelectedHymnId] = useState<string | null>(
    searchParams.get("hymnId")
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch hymns for selection
  const { data: hymns, isLoading: hymnsLoading } = useQuery({
    queryKey: ["hymns-basic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hymns")
        .select("id, title")
        .eq("status", "approved")
        .order("title");
        
      if (error) throw error;
      return data as Hymn[];
    },
  });

  // Fetch tags for selection
  const { data: tags, isLoading: tagsLoading } = useQuery({
    queryKey: ["forum-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_tags")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data;
    },
  });

  // If hymnId is provided in URL, fetch that hymn for display
  const { data: selectedHymn } = useQuery({
    queryKey: ["hymn", selectedHymnId],
    queryFn: async () => {
      if (!selectedHymnId) return null;

      const { data, error } = await supabase
        .from("hymns")
        .select(`
          id,
          title,
          hymn_authors!inner(authors(*))
        `)
        .eq("id", selectedHymnId)
        .single();
        
      if (error) throw error;
      
      return {
        ...data,
        authors: data.hymn_authors.map((ha: any) => ha.authors),
      } as HymnWithRelations;
    },
    enabled: !!selectedHymnId,
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to create a post");
      if (!title.trim()) throw new Error("Title is required");
      if (!content.trim()) throw new Error("Content is required");

      // Create the post
      const { data: post, error: postError } = await supabase
        .from("forum_posts")
        .insert([
          {
            title: title.trim(),
            content: content.trim(),
            user_id: user.id,
            hymn_id: selectedHymnId,
            status: "published",
          },
        ])
        .select()
        .single();

      if (postError) throw postError;

      // If tags were selected, create post_tag relationships
      if (selectedTagIds.length > 0) {
        const tagRelations = selectedTagIds.map((tagId) => ({
          post_id: post.id,
          tag_id: tagId,
        }));

        const { error: tagsError } = await supabase
          .from("forum_post_tags")
          .insert(tagRelations);

        if (tagsError) throw tagsError;
      }

      return post;
    },
    onSuccess: (post) => {
      navigate(`/forum/post/${post.id}`);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : "Failed to create post");
    },
  });

  // Configure ReactQuill editor
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "link",
  ];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createPostMutation.mutate();
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/auth/login?redirect=/forum/create");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <AlertBanner
          type="warning"
          title="Authentication Required"
          message="You need to be logged in to create a forum post."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { label: "Forum", href: "/forum" },
          { label: "Create Post" },
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Create a New Post
      </h1>

      {/* Error display */}
      {error && (
        <AlertBanner
          type="error"
          message={error}
          className="mb-6"
          dismissible
          onDismiss={() => setError(null)}
        />
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Enter a descriptive title"
          />
        </div>

        {/* Related hymn selection */}
        <div>
          <label
            htmlFor="hymnId"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Related Hymn (optional)
          </label>
          
          {hymnsLoading ? (
            <LoadingIndicator size="small" message="Loading hymns..." />
          ) : (
            <select
              id="hymnId"
              name="hymnId"
              value={selectedHymnId || ""}
              onChange={(e) => setSelectedHymnId(e.target.value || null)}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              <option value="">Select a hymn (optional)</option>
              {hymns?.map((hymn) => (
                <option key={hymn.id} value={hymn.id}>
                  {hymn.title}
                </option>
              ))}
            </select>
          )}
          
          {/* Display selected hymn details if any */}
          {selectedHymn && (
            <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md flex items-center">
              <Music className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {selectedHymn.title}
                </p>
                {selectedHymn.authors && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    {selectedHymn.authors.map((a) => a.name).join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tags selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tags (optional)
          </label>
          
          {tagsLoading ? (
            <LoadingIndicator size="small" message="Loading tags..." />
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags?.map((tag) => (
                <div
                  key={tag.id}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
                    selectedTagIds.includes(tag.id)
                      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => {
                    setSelectedTagIds((prev) =>
                      prev.includes(tag.id)
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                >
                  {tag.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content editor */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Content*
          </label>
          <div className="prose-editor">
            <ReactQuill
              id="content"
              value={content}
              onChange={setContent}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Write your post content here..."
              theme="snow"
              className="h-64 mb-12 bg-white dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Guidelines */}
        <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Community Guidelines
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be respectful and considerate of others</li>
                  <li>Stay on topic and provide relevant information</li>
                  <li>
                    Do not post inappropriate or offensive content
                  </li>
                  <li>
                    Avoid posting personal information
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createPostMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
          >
            {createPostMutation.isPending ? (
              <>
                <LoadingIndicator size="small" className="mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Create Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
