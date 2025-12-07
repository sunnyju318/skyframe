// Navigation types for React Navigation
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlueskyPost, BlueskyFeedItem } from "./bluesky.types";

// Bottom Tab Navigator params
export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Create: undefined;
  Inbox: undefined;
  Profile: undefined;
};

// Root Stack (MainTabs + PostDetail)
export type RootStackParamList = {
  MainTabs: undefined;
};

// Home Stack params
export type HomeStackParamList = {
  HomeFeed: undefined;
  PostDetail: { post: BlueskyPost | BlueskyFeedItem };
  Profile: { handle: string };
};

// Search Stack params
export type SearchStackParamList = {
  SearchMain: undefined;
  PostDetail: { post: BlueskyPost | BlueskyFeedItem };
  Profile: { handle: string };
};

// Inbox Stack params
export type InboxStackParamList = {
  InboxMain: undefined;
  PostDetail: { post: BlueskyPost | BlueskyFeedItem };
  Profile: { handle: string };
};

// Profile Stack params
export type ProfileStackParamList = {
  ProfileMain: undefined;
  PostDetail: { post: BlueskyPost | BlueskyFeedItem };
  Profile: { handle: string };
  BoardDetail: { boardId: string };
};

// Combined navigation props
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, "HomeFeed">,
  BottomTabScreenProps<BottomTabParamList>
>;

export type SearchScreenProps = CompositeScreenProps<
  NativeStackScreenProps<SearchStackParamList, "SearchMain">,
  BottomTabScreenProps<BottomTabParamList>
>;

export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, "ProfileMain">,
  BottomTabScreenProps<BottomTabParamList>
>;

export type BoardDetailScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  "BoardDetail"
>;
