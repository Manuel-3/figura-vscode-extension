class WordGroup {
    constructor(words, type, showSuggestion, documentations, selfcalls) {
        this.words = words
        this.type = type
        this.documentations = documentations // array, same length as words, defines documentation for each word
        this.selfcalls = selfcalls // array, same length as words, defines if that word should use : instead of .
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