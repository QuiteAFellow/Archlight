import React, { useRef } from 'react';
import { FlatList, View, Dimensions } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Artist } from '../types';
import { ArtistBioContent } from './ArtistBioScreen';

const { width } = Dimensions.get('window');

type RouteParams = {
  ArtistCarousel: {
    artists: Artist[];
    initialIndex: number;
  };
};

type ArtistCarouselRouteProp = RouteProp<RouteParams, 'ArtistCarousel'>;

const ArtistBioCarouselScreen: React.FC = () => {
  const route = useRoute<ArtistCarouselRouteProp>();
  const { artists, initialIndex } = route.params;
  const flatListRef = useRef<FlatList>(null);

  return (
    <FlatList
      ref={flatListRef}
      data={artists}
      horizontal
      pagingEnabled
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({
        length: width,
        offset: width * index,
        index,
      })}
      keyExtractor={(item) => String(item["AOTD #"])}
      renderItem={({ item }) => (
        <View style={{ width }}>
          <ArtistBioContent artist={item} />
        </View>
      )}
    />
  );
};

export default ArtistBioCarouselScreen;