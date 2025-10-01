import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NewPost, Post } from "@shared/schema";
import axios from "axios";

// 모든 게시물을 가져오는 훅
export const usePosts = () => {
  return useQuery<Post[], Error>({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data } = await axios.get("/api/posts");
      return data;
    },
  });
};

// 새 게시물을 생성하는 훅
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<Post, Error, NewPost>({
    mutationFn: async (newPost) => {
      const { data } = await axios.post("/api/posts", newPost);
      return data;
    },
    onSuccess: () => {
      // 게시물 생성 성공 시, 'posts' 쿼리를 무효화하여 최신 데이터를 다시 불러옵니다.
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
