import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import foodVendorsData from '../../../database/Food Vendor Info 2024.json';
import FilterModal from '../FilterModal';

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
}

const getUniqueValues = (data: FoodVendor[], key: keyof FoodVendor) => {
  const values = data.flatMap(vendor => vendor[key].split(',').map(item => item.trim()));
  return Array.from(new Set(values)).filter(Boolean); // Remove duplicates and empty strings
};

const locationOptions = [
  "Area 931",
  "Centeroo Carts",
  "Food Trucks",
  "Planet Roo",
  "Plaza 1",
  "Plaza 2",
  "Plaza 3",
  "Plaza 4",
  "Plaza 5",
  "Plaza 7",
  "That Tent",
  "The Other Stage",
  "This Stage",
  "This Tent",
  "What Stage",
  "Where in the Woods",
  "Which",
  "Which Stage",
  "Who's Broo Pub"
];

const FoodVendorScreen: React.FC = () => {
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

  const uniqueOptions = {
    type: getUniqueValues(foodVendorsData, 'Type'),
    tags: getUniqueValues(foodVendorsData, 'Food tags'),
    dietary: getUniqueValues(foodVendorsData, 'Dietary Tags'),
    price: getUniqueValues(foodVendorsData, 'Price'),
    location: locationOptions,
  };

  useEffect(() => {
    applyFilters(searchQuery, filters);
  }, [searchQuery, filters]);

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
      filtered = filtered.filter(vendor =>
        filters.dietary.some((dietary: string) => vendor["Dietary Tags"].toLowerCase().includes(dietary.toLowerCase()))
      );
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

  const formatMenuWithSubtext = (menu: string) => {
    return menu.split('|').map((item, index) => {
      const parts = item.split(/(\([^)]*\))/).filter(Boolean); // Split on parentheses and filter out empty strings
      const mainItem = parts.filter(part => !part.startsWith('(')).join(' ').trim();
      const descriptions = parts.filter(part => part.startsWith('('));

      return (
        <View key={index} style={styles.menuItem}>
          <Text style={styles.foodItem}>{mainItem}</Text>
          {descriptions.map((description, i) => (
            <Text key={i} style={styles.foodDescription}>
              {description}
            </Text>
          ))}
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search for food vendors"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilterModal}>
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {filteredVendors.map((vendor: FoodVendor) => (
          <View key={vendor["Food Vendor"]}>
            <View style={styles.vendorContainer}>
              <View style={styles.vendorHeader}>
                <Text style={styles.vendorName}>{vendor["Food Vendor"]}</Text>
                {vendor.Recommended && <Text style={styles.recommended}>⭐</Text>}
              </View>
              <Text>Type: {vendor.Type}</Text>
              <Text>Tags: {vendor["Food tags"]}</Text>
              <Text>Dietary: {vendor["Dietary Tags"]}</Text>
              <Text>Price: {vendor.Price}</Text>
              <Text>Location: {vendor.Location}</Text>
              <Text style={styles.menuSectionHeader}>Food Menu:</Text>
              {formatMenuWithSubtext(vendor["Food Menu"])}
              <Text style={styles.menuSectionHeader}>Drink/Desert Menu:</Text>
              {formatMenuWithSubtext(vendor["Drink/Desert Menu"])}
              {vendor.Recommended && vendor["Recommended Item(s)"] && (
                <Text>Recommended Item(s): {vendor["Recommended Item(s)"]}</Text>
              )}
            </View>
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
    </View>
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
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    flex: 1,
  },
  recommended: {
    color: 'gold',
    fontSize: 18,
  },
  menuItem: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  foodItem: {
    fontSize: 14,
  },
  foodDescription: {
    color: 'darkgrey',
    fontStyle: 'italic',
    fontSize: 12,
    marginLeft: 15,
  },
  menuSectionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
});

export default FoodVendorScreen;