import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import rawFoodVendorsData from '../../../database/Food Vendor Info 2025.json';
import FilterModal from '../FilterModal';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';  // Import theme context
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FoodVendor {
  "Food Vendor": string;
  "Type": string;
  "Food tags": string;
  "Dietary Tags": string;
  "Location": string;
  "Price": string;
  "Food Menu": string;
  "Drink/Desert Menu": string;
  "Notes": string;
  "Recommended": string;
  "Recommended Item(s)": string;
  "NewFor2025?": boolean;
}

// Convert "NewFor2025?" to boolean
const foodVendorsData: FoodVendor[] = (rawFoodVendorsData as any[]).map(vendor => ({
  ...vendor,
  // Accepts true, "true", "yes", "Yes", "*" as true, everything else as false
  "NewFor2025?": vendor["NewFor2025?"] === true ||
                  vendor["NewFor2025?"] === "true" ||
                  vendor["NewFor2025?"] === "yes" ||
                  vendor["NewFor2025?"] === "Yes" ||
                  vendor["NewFor2025?"] === "*"
}));

const getUniqueValues = (data: FoodVendor[], key: keyof FoodVendor) => {
  const values = data.flatMap(vendor => {
    const value = vendor[key];
    if (typeof value === 'string') {
      return value.split(',').map((item: string) => item.trim());
    }
    return []; // Ignore booleans or undefined
  });
  return Array.from(new Set(values)).filter(Boolean); // Remove duplicates and empty strings
};

const dietaryTagMap: Record<string, string> = {
  'Vegetarian': 'Vegetarian',
  'Vegan': 'Vegan',
  'Gluten Free': 'GF',
};

const splitParenthesisText = (text: string) => {
  const parts = text.split(/(\(.*?\))/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith('(') && part.endsWith(')')) {
      return (
        <Text key={index} style={styles.parenthesisText}>
          {'\n'}{part}{'\n'}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

const FoodVendorScreen: React.FC = () => {
  const { themeData } = useTheme();  // Extract theme data to dynamically set the colors
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState<FoodVendor[]>(foodVendorsData);
  const [filters, setFilters] = useState({
    type: [],
    tags: [],
    dietary: [],
    price: [],
    location: []
  });
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [checkedVendors, setCheckedVendors] = useState<{ [vendorName: string]: boolean }>({});
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const uniqueOptions = {
    type: getUniqueValues(foodVendorsData, 'Type'),
    tags: getUniqueValues(foodVendorsData, 'Food tags'),
    dietary: ['Vegetarian', 'Vegan', 'Gluten Free'],
    price: ['$', '$$', '$$$'],
    location: getUniqueValues(foodVendorsData, 'Location'),
  };

  useEffect(() => {
    // Check if disclaimer should be shown
    AsyncStorage.getItem('hideFoodVendorDisclaimer').then((value) => {
      if (value !== 'true') setShowDisclaimer(true);
    });
  }, []);

  useEffect(() => {
    applyFilters(searchQuery, filters);
  }, [searchQuery, filters, showRecommendedOnly]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const applyFilters = (query: string, filters: any) => {
    let filtered = foodVendorsData;
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((vendor: FoodVendor) =>
        vendor["Food Vendor"].toLowerCase().includes(lowerQuery) ||
        vendor.Type.toLowerCase().includes(lowerQuery) ||
        vendor["Food tags"].toLowerCase().includes(lowerQuery) ||
        vendor["Dietary Tags"].toLowerCase().includes(lowerQuery) ||
        vendor.Location.toLowerCase().includes(lowerQuery) ||
        vendor.Price.toLowerCase().includes(lowerQuery) ||
        vendor["Food Menu"].toLowerCase().includes(lowerQuery) ||
        vendor["Drink/Desert Menu"].toLowerCase().includes(lowerQuery)
      );
    }
    if (filters.type.length) {
      filtered = filtered.filter(vendor =>
        filters.type.includes(vendor.Type)
      );
    }
    if (filters.tags.length) {
      filtered = filtered.filter(vendor =>
        filters.tags.some((tag: string) => vendor["Food tags"].toLowerCase().includes(tag.toLowerCase()))
      );
    }
    if (filters.dietary.length) {
      filtered = filtered.filter(vendor => {
        const vendorDietaryTags = (vendor["Dietary Tags"] || '')
          .split(',')
          .map(tag => tag.trim());

        return filters.dietary.some((userSelected: string) =>
          vendorDietaryTags.includes(dietaryTagMap[userSelected])
        );
      });
    }
    if (filters.price.length) {
      filtered = filtered.filter(vendor =>
        filters.price.includes(vendor.Price)
      );
    }
    if (filters.location.length) {
      filtered = filtered.filter(vendor =>
        filters.location.some((location: string) => vendor.Location.toLowerCase().includes(location.toLowerCase()))
      );
    }
    if (showRecommendedOnly) {
      filtered = filtered.filter(vendor => vendor.Recommended);
    }
    setFilteredVendors(filtered);
  };

  const handleOpenFilterModal = () => {
    setFilterModalVisible(true);
  };

  const handleCloseFilterModal = () => {
    setFilterModalVisible(false);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    applyFilters(searchQuery, newFilters);
  };

  type CustomCheckboxProps = {
    checked: boolean;
    onPress: () => void;
  };

  const handleCloseDisclaimer = async () => {
    setShowDisclaimer(false);
    if (dontShowAgain) {
      await AsyncStorage.setItem('hideFoodVendorDisclaimer', 'true');
    }
  };

const Container = Platform.OS === 'ios'
  ? (props: any) => <SafeAreaView edges={['top', 'left', 'right']} {...props} />
  : View;

  return (
    <>
    <Modal
      visible={showDisclaimer}
      transparent
      animationType="fade"
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: themeData.backgroundColor,
          padding: 24,
          borderRadius: 12,
          width: '85%',
          alignItems: 'center'
        }}>
          <Text style={{ color: themeData.textColor, fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
            Food Vendor Information Disclaimer
          </Text>
          <Text style={{ color: themeData.textColor, marginBottom: 20, textAlign: 'center' }}>
            Some food vendor information is being sourced from 2024. While dietary tags and locations should be accurate, some menu items, prices, tags, and types may be inaccurate, complete guesses, or unavailable. Always double check with the food vendors directly for dietary restrictions, allergies, and other concerns.
          </Text>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
            onPress={() => setDontShowAgain(!dontShowAgain)}
          >
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: themeData.textColor,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
              backgroundColor: dontShowAgain ? themeData.highlightColor : 'transparent'
            }}>
              {dontShowAgain && (
                <Ionicons name="checkmark" size={18} color={themeData.backgroundColor} />
              )}
            </View>
            <Text style={{ color: themeData.textColor }}>Don't show again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: themeData.highlightColor,
              paddingVertical: 10,
              paddingHorizontal: 32,
              borderRadius: 6
            }}
            onPress={handleCloseDisclaimer}
          >
            <Text style={{ color: themeData.buttonText, fontWeight: 'bold' }}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeData.backgroundColor }]}
      {...(Platform.OS === 'ios' ? { edges: ['top', 'left', 'right'] } : {})}
    >
      <TextInput
        style={[styles.searchBar, { color: themeData.textColor, borderColor: themeData.textColor }]}
        placeholder="Search"
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor={themeData.textColor} // Set placeholder text color based on the theme
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: themeData.highlightColor }]} onPress={handleOpenFilterModal}>
          <Text style={[styles.filterButtonText, { color: themeData.buttonText }]}>Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowRecommendedOnly(!showRecommendedOnly)}
          style={[
            styles.recommendedButton,
            { backgroundColor: showRecommendedOnly ? themeData.highlightColor : 'transparent' },
            { borderColor: showRecommendedOnly ? 'transparent' : themeData.textColor }
          ]}
        >
          <Ionicons name="star" size={24} color={showRecommendedOnly ? themeData.backgroundColor: themeData.textColor } />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredVendors.map((vendor: FoodVendor) => (
          <View key={vendor["Food Vendor"]} style={[styles.vendorContainer, { backgroundColor: themeData.backgroundColor }]}>
            <View style={styles.vendorHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.vendorName, { color: themeData.textColor }]}>
                  {vendor["Food Vendor"]}
                </Text>
                {vendor["NewFor2025?"] && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }} />
              {vendor.Recommended && <Text style={styles.recommended}>⭐</Text>}
            </View>
            <Text style={{ color: themeData.textColor }}>Type: {vendor.Type}</Text>
            <Text style={{ color: themeData.textColor }}>Tags: {vendor["Food tags"]}</Text>
            <Text style={{ color: themeData.textColor }}>Dietary: {vendor["Dietary Tags"]}</Text>
            <Text style={{ color: themeData.textColor }}>Price: {vendor.Price}</Text>
            <Text style={{ color: themeData.textColor }}>Location: {vendor.Location}</Text>
            {vendor["Food Menu"] && (
              <>
                <Text style={[styles.menuSectionHeader, { color: themeData.textColor }]}>Food Menu:</Text>
                {vendor["Food Menu"].split('|').map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Text style={{ color: themeData.textColor }}>{item.split('(')[0]}</Text>
                    {item.includes('(') && item.includes(')') && (
                      <Text style={[styles.parenthesisText, { color: themeData.textColor }]}>
                        {`(${item.split('(')[1].split(')')[0]})`}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
            {vendor["Drink/Desert Menu"] && (
              <>
                <Text style={[styles.menuSectionHeader, { color: themeData.textColor }]}>Drink/Desert Menu:</Text>
                {vendor["Drink/Desert Menu"].split('|').map((item, index) => (
                  <View key={index} style={styles.menuItem}>
                    <Text style={{ color: themeData.textColor }}>{item.split('(')[0]}</Text>
                    {item.includes('(') && item.includes(')') && (
                      <Text style={[styles.parenthesisText, { color: themeData.textColor }]}>
                        {`(${item.split('(')[1].split(')')[0]})`}
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}
          </View>
        ))}
      </ScrollView>
      <FilterModal
        visible={filterModalVisible}
        onClose={handleCloseFilterModal}
        onApplyFilters={handleApplyFilters}
        existingFilters={filters}
        uniqueOptions={uniqueOptions}
      />
    </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchBar: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    marginTop: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  filterButtonText: {
    fontWeight: 'bold',
  },
  recommendedButton: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'grey',
    borderWidth: 1,
  },
  recommendedButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  vendorContainer: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vendorName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginright: 4
  },
  recommended: {
    color: 'gold',
    fontSize: 18,
  },
  menuSectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  menuItem: {
    marginBottom: 5, // Adjust this value to control the space between menu items
  },
  parenthesisText: {
    marginTop: -3, // Adjust this value to control the bottom margin for text in parenthesis
    color: 'grey',
    fontStyle: 'italic',
    marginBottom: 0
  },
  newBadge: {
    backgroundColor: '#ff4081',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    alignSelf: 'center',
  },
  newBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default FoodVendorScreen;