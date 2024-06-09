import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { FontAwesome } from '@expo/vector-icons';

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
  "Who's Broo Pub"
].sort();

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters, existingFilters, uniqueOptions }) => {
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

  const renderMultiSelectList = (label: string, items: string[], selectedItems: string[], onSelectedItemsChange: (selected: string[]) => void) => (
    <View style={styles.filterSection}>
      <TouchableOpacity onPress={() => setExpandedCategory(expandedCategory === label ? null : label)} style={styles.filterCategory}>
        <Text style={styles.label}>{label}</Text>
        <FontAwesome
          name={expandedCategory === label ? 'angle-down' : 'angle-right'}
          size={20}
          color="black"
        />
      </TouchableOpacity>
      {expandedCategory === label && (
        <ScrollView style={styles.scrollableList}>
          <View style={styles.listItem}>
            <Text style={styles.selectAllText}>Select All</Text>
            <Checkbox
              status={selectedItems.length === items.length ? 'checked' : 'unchecked'}
              onPress={() => toggleSelectAll(selectedItems, onSelectedItemsChange, items)}
            />
          </View>
          {items.map((item) => (
            <View key={item} style={styles.listItem}>
              <Text>{item}</Text>
              <Checkbox
                status={selectedItems.includes(item) ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (selectedItems.includes(item)) {
                    onSelectedItemsChange(selectedItems.filter(i => i !== item));
                  } else {
                    onSelectedItemsChange([...selectedItems, item]);
                  }
                }}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Filter Vendors</Text>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {renderMultiSelectList('Type', uniqueOptions.type.sort(), selectedTypes, setSelectedTypes)}
            {renderMultiSelectList('Tags', uniqueOptions.tags.sort(), selectedTags, setSelectedTags)}
            {renderMultiSelectList('Dietary', ['V', 'VG', 'GF'], selectedDietary, setSelectedDietary)}
            {renderMultiSelectList('Price', ['$', '$$', '$$$'], selectedPrices, setSelectedPrices)}
            {renderMultiSelectList('Location', locationOptions, selectedLocations, setSelectedLocations)}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
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
    backgroundColor: 'white',
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
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  applyButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default FilterModal;