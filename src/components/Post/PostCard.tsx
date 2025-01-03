import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import PostHeader from "./PostHeader";
import PostImage from "./PostImage";
import PostActions from "./PostActions";
import PostComments from "./PostComments";
import ImageModal from "./ImageModal";
import { motion } from "framer-motion";
import { useOfflineCache } from "../../hooks/useOfflineCache";
import { PostService } from "../../lib/firebase/posts/postService";
import LinesEllipsis from "react-lines-ellipsis";

interface PostCardProps {
  post: {
    id: string;
    userId: string;
    userName: string;
    userPhoto: string;
    imageUrl?: string;
    caption: string;
    likes: string[];
    comments: any[];
    createdAt: any;
    isPublic?: boolean;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { currentUser } = useAuth();
  const { cachePost } = useOfflineCache();

  useEffect(() => {
    if (currentUser) {
      setIsLiked(post.likes.includes(currentUser.uid));
    }
  }, [currentUser, post.likes]);

  useEffect(() => {
    cachePost(post);
  }, [post]);

  const handleLike = async () => {
    return PostService.toggleLike(post.id, currentUser?.uid || "");
  };
  // Line ellipsis
  const [ellipsis, setEllipsis] = useState(false);
  const handleEllipsis = () => setEllipsis(!ellipsis);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4"
      >
        <PostHeader
          userId={post.userId}
          userName={post.userName}
          userPhoto={post.userPhoto}
          imageUrl={post.imageUrl || ""}
          postId={post.id}
          createdAt={post.createdAt}
          isPublic={post.isPublic}
        />

        <div className="px-4 pb-4">
          {ellipsis ? (
            <p
              onClick={handleEllipsis}
              className="cursor-pointer text-wrap whitespace-pre text-sm text-gray-600 dark:text-gray-300"
            >
              {post.caption}
            </p>
          ) : (
            <div
              onClick={handleEllipsis}
              className="cursor-pointer text-wrap whitespace-pre text-sm text-gray-600 dark:text-gray-300"
            >
              <LinesEllipsis
                text={post.caption}
                maxLine={4}
                ellipsis={<span>...see more</span>}
                trimRight
                basedOn="letters"
              />
            </div>
          )}
        </div>

        {post.imageUrl && (
          <PostImage
            imageUrl={post.imageUrl}
            caption={post.caption}
            onClick={() => setShowImageModal(true)}
          />
        )}

        <PostActions
          postId={post.id}
          userId={currentUser?.uid}
          isLiked={isLiked}
          setIsLiked={setIsLiked}
          likesCount={post.likes?.length || 0}
          onCommentClick={() => setShowComments(!showComments)}
          onImageClick={() => post.imageUrl && setShowImageModal(true)}
          onLike={handleLike}
        />

        <div className="p-4">
          <PostComments
            postId={post.id}
            comments={post.comments}
            isVisible={showComments}
          />
        </div>
      </motion.div>

      {post.imageUrl && (
        <ImageModal
          imageUrl={post.imageUrl}
          caption={post.caption}
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </>
  );
}
