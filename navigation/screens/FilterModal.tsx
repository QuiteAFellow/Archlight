import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Animated } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  existingFilters: any;
  uniqueOptions: any;
}

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
  "Who's Broo Pub",
  "GA+ Lounge",
  "VIP Lounge",
].sort();


const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters, existingFilters, uniqueOptions }) => {
  const { themeData } = useTheme();  // Extract theme data to dynamically set the colors
  const [selectedTypes, setSelectedTypes] = useState<string[]>(existingFilters.type || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFilters.tags || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(existingFilters.dietary || []);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(existingFilters.price || []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(existingFilters.location || []);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const applyFilters = () => {
    onApplyFilters({
      type: selectedTypes,
      tags: selectedTags,
      dietary: selectedDietary,
      price: selectedPrices,
      location: selectedLocations,
    });
    onClose();
  };

  const toggleSelectAll = (selectedItems: string[], setSelectedItems: (items: string[]) => void, items: string[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  const renderCheckbox = (checked: boolean, onPress: () => void) => {
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity onPress={onPress} style={{
          width: 24,
          height: 24,
          borderWidth: 2,
          borderColor: checked ? themeData.highlightColor : '#888',
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: checked ? themeData.highlightColor : 'transparent',
        }}>
          {checked && (
            <View style={{
              width: 12,
              height: 12,
              backgroundColor: 'white',
              borderRadius: 2,
            }}/>
          )}
        </TouchableOpacity>
      );
    }
    // Android and others use the default
    return (
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        onPress={onPress}
        color={themeData.highlightColor}
      />
    );
  };

  const renderMultiSelectList = (label: string, items: string[], selectedItems: string[], onSelectedItemsChange: (selected: string[]) => void) => (
    <View style={styles.filterSection}>
      <TouchableOpacity onPress={() => setExpandedCategory(expandedCategory === label ? null : label)} style={styles.filterCategory}>
        <Text style={[styles.label, { color: themeData.textColor }]}>{label}</Text>
        <FontAwesome
          name={expandedCategory === label ? 'angle-down' : 'angle-right'}
          size={20}
          color={themeData.textColor}
        />
      </TouchableOpacity>
      {expandedCategory === label && (
        <ScrollView
          style={styles.scrollableList}
          nestedScrollEnabled={true}
        >
          <View style={styles.listItem}>
            <Text style={[styles.selectAllText, { color: themeData.textColor }]}>Select All</Text>
            {renderCheckbox(
              selectedItems.length === items.length,
              () => toggleSelectAll(selectedItems, onSelectedItemsChange, items)
            )}
          </View>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.listItem}
              activeOpacity={0.7}
              onPress={() => {
                if (selectedItems.includes(item)) {
                  onSelectedItemsChange(selectedItems.filter(i => i !== item));
                } else {
                  onSelectedItemsChange([...selectedItems, item]);
                }
              }}
            >
              <Text style={{ color: themeData.textColor }}>{item}</Text>
              {renderCheckbox(
                selectedItems.includes(item),
                () => {
                  if (selectedItems.includes(item)) {
                    onSelectedItemsChange(selectedItems.filter(i => i !== item));
                  } else {
                    onSelectedItemsChange([...selectedItems, item]);
                  }
                }
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.container, { backgroundColor: themeData.backgroundColor }]}>
          <Text style={[styles.title, { color: themeData.textColor }]}>Food Vendor Filters</Text>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {renderMultiSelectList('Type', uniqueOptions.type.sort(), selectedTypes, setSelectedTypes)}
            {renderMultiSelectList('Tags', uniqueOptions.tags.sort(), selectedTags, setSelectedTags)}
            {renderMultiSelectList('Dietary', ['Vegetarian', 'Vegan', 'Gluten Free'], selectedDietary, setSelectedDietary)}
            {renderMultiSelectList('Price', ['$', '$$', '$$$'], selectedPrices, setSelectedPrices)}
            {renderMultiSelectList('Location', locationOptions, selectedLocations, setSelectedLocations)}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: themeData.highlightColor }]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: 'red' }]}
              onPress={() => {
                setSelectedTypes([]);
                setSelectedTags([]);
                setSelectedDietary([]);
                setSelectedPrices([]);
                setSelectedLocations([]);
              }}
            >
              <Text style={styles.clearButtonText} numberOfLines={1} ellipsizeMode="tail">
                Clear All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: themeData.subtextColor }]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '80%',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollView: {
    flexGrow: 1,
  },
  filterSection: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  filterCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollableList: {
    maxHeight: 240, //maximum height of the dropdown
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectAllText: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 0, // remove horizontal padding for edge-to-edge
  },
  applyButton: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 5,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 5,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 5,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default FilterModal;