// Navigation types for React Navigation
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Bottom Tab Navigator params
export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Create: undefined;
  Inbox: undefined;
  Profile: undefined;
};

// Home Stack params
export type HomeStackParamList = {
  HomeFeed: undefined;
  PostDetail: { postUri: string };
};

// Search Stack params
export type SearchStackParamList = {
  SearchMain: undefined;
  SearchResults: { query: string };
};

// Profile Stack params
export type ProfileStackParamList = {
  ProfileMain: undefined;
  BoardDetail: { boardId: string };
  VisitingProfile: { handle: string };
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
