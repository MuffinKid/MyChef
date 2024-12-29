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
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon, XCircleIcon } from 'react-native-heroicons/outline';

const API_URL = 'http://192.168.39.108:5001';
const MAX_INGREDIENTS = 100;

export default function HomeScreen() {
  const [ingredients, setIngredients] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

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
    console.log('Fetching recipes for:', ingredients);
  
    try {
      // First, check if the server is healthy
      const healthCheck = await fetch(`${API_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }

      const response = await fetch(`${API_URL}/generate-recipes`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'http://192.168.39.108'
        },
        body: JSON.stringify({
          ingredients: ingredients.join(', '),
          num_recipes: 3,
        }),
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Received data:', data);
  
      if (data.error) {
        throw new Error(data.error);
      }
  
      if (!data.recipes || !Array.isArray(data.recipes)) {
        throw new Error('Invalid recipe data format');
      }
  
      setRecipes(data.recipes);
  
    } catch (error) {
      console.error('Error fetching recipes:', error);
      Alert.alert(
        'Error',
        error.message === 'Server is not responding' 
          ? 'Unable to connect to the server. Please check your connection and try again.'
          : `Failed to get recipes: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const RecipeCard = ({ recipe }) => (
    <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
      <Text className="text-xl font-bold text-[#5375c2] mb-2">
        {recipe.recipe_name}
      </Text>

      <View className="flex-row space-x-3 mb-3">
        <View className="bg-gray-100 rounded-full px-3 py-1">
          <Text className="text-sm">⏱️ {recipe.cooking_time}</Text>
        </View>
        <View className="bg-gray-100 rounded-full px-3 py-1">
          <Text className="text-sm">📊 {recipe.difficulty}</Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="font-semibold mb-1">Nutrition Info</Text>
        <Text>🔥 {recipe.nutrition.calories}</Text>
        <Text>💪 {recipe.nutrition.protein}</Text>
      </View>

      <View className="mb-3">
        <Text className="font-semibold mb-2">Ingredients:</Text>
        {recipe.ingredients_list.map((ingredient, idx) => (
          <Text key={idx} className="text-gray-700 ml-2">• {ingredient}</Text>
        ))}
      </View>

      <View className="mb-3">
        <Text className="font-semibold mb-2">Instructions:</Text>
        {recipe.instructions.map((step, idx) => (
          <Text key={idx} className="text-gray-700 mb-1 ml-2">
            {idx + 1}. {step}
          </Text>
        ))}
      </View>

      {recipe.tips && (
        <View className="bg-blue-50 rounded-lg p-3">
          <Text className="font-semibold mb-1">💡 Tips:</Text>
          <Text className="text-gray-700">{recipe.tips}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        className="space-y-4"
      >
        {/* Header */}
        <View className="px-4 pt-4">
          <Text style={{ fontSize: hp(3.8) }} className="font-semibold text-neutral-600">
            What will you make
          </Text>
          <Text style={{ fontSize: hp(3.8) }} className="font-semibold text-neutral-600">
            <Text style={{ color: '#5375c2' }}> today?</Text>
          </Text>
        </View>

        {/* Input Section */}
        <View className="px-4">
          <View className="flex-row items-center space-x-2">
            <View className="flex-1 bg-white rounded-full shadow-sm">
              <TextInput
                placeholder="Add an ingredient (e.g., chicken)"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleAddIngredient}
                className="px-4 py-3 text-base"
                returnKeyType="done"
                maxLength={30}
              />
            </View>
            <TouchableOpacity
              onPress={handleAddIngredient}
              className="bg-[#5375c2] p-3 rounded-full shadow-sm"
            >
              <MagnifyingGlassIcon size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ingredients Tags */}
        {ingredients.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4"
          >
            <View className="flex-row space-x-2">
              {ingredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRemoveIngredient(ingredient)}
                  className="flex-row items-center bg-[#5375c2] rounded-full px-3 py-2 space-x-1"
                >
                  <Text className="text-white">{ingredient}</Text>
                  <XCircleIcon size={16} color="white" />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Generate Button */}
        <View className="px-4">
          <TouchableOpacity
            onPress={fetchRecipes}
            disabled={loading}
            className={`${
              loading ? 'bg-gray-400' : 'bg-[#5375c2]'
            } rounded-full py-4 items-center shadow-sm`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Generate Recipes
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Recipes List */}
        {recipes.length > 0 ? (
          <View className="px-4">
            <Text className="text-xl font-semibold mb-4">Your Recipes:</Text>
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </View>
        ) : !loading && (
          <View className="px-4 py-8">
            <Text className="text-center text-gray-500">
              Add ingredients and generate recipes to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}