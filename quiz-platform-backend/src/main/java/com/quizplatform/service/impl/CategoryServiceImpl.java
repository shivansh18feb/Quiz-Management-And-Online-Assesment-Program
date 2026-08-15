package com.quizplatform.service.impl;

import com.quizplatform.dto.request.CategoryRequest;
import com.quizplatform.dto.response.CategoryResponse;
import com.quizplatform.entity.Category;
import com.quizplatform.exception.BadRequestException;
import com.quizplatform.exception.DuplicateResourceException;
import com.quizplatform.exception.ResourceNotFoundException;
import com.quizplatform.mapper.CategoryMapper;
import com.quizplatform.repository.CategoryRepository;
import com.quizplatform.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }
        Category category = Category.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .build();
        Category saved = categoryRepository.save(category);
        log.info("Category created: {}", saved.getName());
        return categoryMapper.toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Category already exists with name: " + request.getName());
        }
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        Category saved = categoryRepository.save(category);
        log.info("Category updated: {}", saved.getName());
        return categoryMapper.toCategoryResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (category.getQuizzes() != null && !category.getQuizzes().isEmpty()) {
            throw new BadRequestException(
                    "Cannot delete category '" + category.getName() + "' because it has " +
                    category.getQuizzes().size() + " quiz(zes) associated with it. " +
                    "Please reassign or delete the quizzes first.");
        }
        categoryRepository.delete(category);
        log.info("Category deleted with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return categoryMapper.toCategoryResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse)
                .collect(Collectors.toList());
    }
}
