import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import MultiSelect from 'react-native-multiple-select';

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
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters, existingFilters, uniqueOptions }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(existingFilters.type || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFilters.tags || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(existingFilters.dietary || []);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(existingFilters.price || []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(existingFilters.location || []);
  const [openSection, setOpenSection] = useState<string>('type'); // Default to the first section being open

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

  const renderDropdown = (label: string, items: string[], selectedItems: string[], onSelectedItemsChange: (selected: string[]) => void, section: string) => (
    <View style={[styles.filterSection, openSection === section && styles.expandedFilterSection]}>
      <View>
        <Text style={styles.label}>{label}</Text>
      </View>
      {openSection === section && (
        <View style={styles.multiSelectContainer}>
          <MultiSelect
            items={items.map((item: string) => ({ id: item, name: item }))}
            uniqueKey="id"
            onSelectedItemsChange={onSelectedItemsChange}
            selectedItems={selectedItems}
            selectText={`Select ${label}`}
            displayKey="name"
            hideSubmitButton
            styleDropdownMenuSubsection={styles.multiSelectDropdown}
            styleListContainer={styles.multiSelectListContainer}
            styleSelectorContainer={styles.multiSelectSelectorContainer}
            styleInputGroup={styles.multiSelectInputGroup}
            styleTextDropdown={styles.multiSelectTextDropdown}
            styleTextDropdownSelected={styles.multiSelectTextDropdownSelected}
          />
        </View>
      )}
    </View>
  );

  const renderButtonGroup = (label: string, items: string[], selectedItems: string[], onSelectedItemsChange: (selected: string[]) => void) => (
    <View style={styles.filterSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttonGroup}>
        {items.map((item: string) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              key={item}
              style={[styles.button, isSelected && styles.selectedButton]}
              onPress={() => {
                if (isSelected) {
                  onSelectedItemsChange(selectedItems.filter(i => i !== item));
                } else {
                  onSelectedItemsChange([...selectedItems, item]);
                }
              }}
            >
              <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Filter Vendors</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <TouchableOpacity onPress={() => setOpenSection('type')}>
              {renderDropdown('Type', uniqueOptions.type, selectedTypes, setSelectedTypes, 'type')}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setOpenSection('tags')}>
              {renderDropdown('Tags', uniqueOptions.tags, selectedTags, setSelectedTags, 'tags')}
            </TouchableOpacity>
            {renderButtonGroup('Dietary', ['V', 'VG', 'GF'], selectedDietary, setSelectedDietary)}
            {renderButtonGroup('Price', ['$', '$$', '$$$'], selectedPrices, setSelectedPrices)}
            <TouchableOpacity onPress={() => setOpenSection('location')}>
              {renderDropdown('Location', locationOptions, selectedLocations, setSelectedLocations, 'location')}
            </TouchableOpacity>
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
    height: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  filterSection: {
    marginBottom: 10,
  },
  expandedFilterSection: {
    marginBottom: 50, // Add more space when the filter section is expanded
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  multiSelectContainer: {
    maxHeight: 200, // Adjust this value to set the maximum height of the dropdown
  },
  expandedMultiSelectContainer: {
    maxHeight: 300, // Larger maximum height for expanded dropdowns
  },
  multiSelectDropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  multiSelectListContainer: {
    maxHeight: 300, // Adjust height as necessary
  },
  multiSelectSelectorContainer: {
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  multiSelectInputGroup: {
    borderColor: '#ccc',
  },
  multiSelectTextDropdown: {
    paddingLeft: 10,
    paddingRight: 30,
  },
  multiSelectTextDropdownSelected: {
    paddingLeft: 10,
    paddingRight: 30,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  button: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    margin: 5,
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    color: 'black',
  },
  selectedButtonText: {
    color: 'white',
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