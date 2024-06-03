import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MultiSelect from 'react-native-multiple-select';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  existingFilters: any;
  uniqueOptions: any;
}

const locationOptions = [
  "What Stage",
  "Which Stage",
  "This Tent",
  "That Tent",
  "The Other Tent",
  "Silent Disco",
  "Camping Area",
  "Food Truck Area"
];

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApplyFilters, existingFilters, uniqueOptions }) => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(existingFilters.type || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFilters.tags || []);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(existingFilters.dietary || []);
  const [selectedPrices, setSelectedPrices] = useState<string[]>(existingFilters.price || []);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(existingFilters.location || []);
  const [openSection, setOpenSection] = useState<string | null>(null);

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

  const renderMultiSelect = (label: string, items: string[], selectedItems: string[], onSelectedItemsChange: (selected: string[]) => void, section: string) => (
    <View style={styles.filterSection}>
      <TouchableOpacity onPress={() => setOpenSection(openSection === section ? null : section)}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
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

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Filter Vendors</Text>
          <FlatList
            data={['type', 'tags', 'dietary', 'price', 'location']}
            keyExtractor={(item) => item}
            renderItem={({ item }) => {
              switch (item) {
                case 'type':
                  return renderMultiSelect('Type', uniqueOptions.type, selectedTypes, setSelectedTypes, 'type');
                case 'tags':
                  return renderMultiSelect('Tags', uniqueOptions.tags, selectedTags, setSelectedTags, 'tags');
                case 'dietary':
                  return renderMultiSelect('Dietary', uniqueOptions.dietary, selectedDietary, setSelectedDietary, 'dietary');
                case 'price':
                  return renderMultiSelect('Price', uniqueOptions.price.sort(), selectedPrices, setSelectedPrices, 'price');
                case 'location':
                  return renderMultiSelect('Location', locationOptions, selectedLocations, setSelectedLocations, 'location');
                default:
                  return null;
              }
            }}
            contentContainerStyle={styles.scrollView}
          />
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
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  multiSelectContainer: {
    maxHeight: 200, // Adjust this value to set the maximum height of the dropdown
  },
  multiSelectDropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
  },
  multiSelectListContainer: {
    maxHeight: 200, // Adjust height as necessary
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