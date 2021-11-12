class WordGroup {
    constructor(words, type, showSuggestion) {
        this.words = words
        this.type = type
        if (showSuggestion == undefined) {
            this.showSuggestion = true
        }
        else {
            this.showSuggestion = showSuggestion
        }
        this.subgroups = []
    }
    addSubGroup(group) {
        this.subgroups.push(group)
    }
}

module.exports = WordGroup;