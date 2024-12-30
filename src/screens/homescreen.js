import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { PlusIcon, XCircleIcon } from 'react-native-heroicons/outline';

const API_URL = 'http://192.168.39.108:5001';
const MAX_INGREDIENTS = 100;

export default function HomeScreen() {
  const [ingredients, setIngredients] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleAddIngredient = useCallback(() => {
    const trimmedInput = inputText.trim().toLowerCase();
    if (!trimmedInput) {
      Alert.alert('Invalid Input', 'Please enter an ingredient');
      return;
    }

    if (ingredients.length >= MAX_INGREDIENTS) {
      Alert.alert('Maximum Ingredients', `You can only add up to ${MAX_INGREDIENTS} ingredients`);
      return;
    }

    if (ingredients.includes(trimmedInput)) {
      Alert.alert('Duplicate Ingredient', 'This ingredient is already in your list');
      return;
    }

    setIngredients(prev => [...prev, trimmedInput]);
    setInputText('');
  }, [inputText, ingredients]);

  const handleRemoveIngredient = useCallback((ingredient) => {
    setIngredients(prev => prev.filter(item => item !== ingredient));
  }, []);

  const fetchRecipes = async () => {
    if (ingredients.length === 0) {
      Alert.alert('No Ingredients', 'Please add at least one ingredient first.');
      return;
    }

    setLoading(true);

    try {
      const healthCheck = await fetch(`${API_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }

      const response = await fetch(`${API_URL}/generate-recipes`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.join(', '),
          num_recipes: 3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      Alert.alert('Error', `Failed to get recipes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const IngredientChip = ({ ingredient }) => (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
    }}>
      <Text style={{ color: '#2E7D32', marginRight: 6 }}>{ingredient}</Text>
      <TouchableOpacity onPress={() => handleRemoveIngredient(ingredient)}>
        <XCircleIcon size={18} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );

  const RecipeCard = ({ recipe }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('RecipeDetail', { recipe })}
      style={{
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 }}>
        {recipe.recipe_name}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>⏱️ {recipe.cooking_time}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#666' }}>📊 {recipe.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#1B5E20' }}>
            What's cooking?
          </Text>
          <Text style={{ fontSize: 16, color: '#666', marginTop: 8 }}>
            Add ingredients to discover recipes
          </Text>
        </View>

        {/* Input Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TextInput
              placeholder="Add an ingredient (e.g., chicken)"
              value={inputText}
              onChangeText={setInputText}
              style={{
                flex: 1,
                borderRadius: 12,
                backgroundColor: 'white',
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                marginRight: 12,
              }}
              maxLength={30}
            />
            <TouchableOpacity
              onPress={handleAddIngredient}
              style={{
                backgroundColor: '#2E7D32',
                padding: 12,
                borderRadius: 12,
                justifyContent: 'center',
                elevation: 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              <PlusIcon size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
              {ingredients.map((ingredient, index) => (
                <IngredientChip key={index} ingredient={ingredient} />
              ))}
            </View>
          )}

          {/* Generate Button */}
          <TouchableOpacity
            onPress={fetchRecipes}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#A5D6A7' : '#2E7D32',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                Generate Recipes
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recipe Cards */}
        {recipes.length > 0 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1B5E20', marginBottom: 16 }}>
              Your Recipes
            </Text>
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
