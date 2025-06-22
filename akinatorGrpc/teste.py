import akinator

aki = akinator.Akinator()
aki.start_game(language='pt')

while not aki.finished:
    print(f"\nQuestão: {str(aki)}")
    user_input = input(
        "Sua resposta ([s]im/[n]ão/[sla] Não sei/[p]rovavelmente/[pn] provavelmente não, [v]oltar): "
    ).strip().lower()
    if user_input == "v":
        try:
            aki.back()
        except akinator.CantGoBackAnyFurther:
            print("Você não pode voltar atrás!")
    else:
        try:
            if (user_input == 's'):
                user_input = 'y'
            elif (user_input == 'sla'):
                user_input = 'i'
            aki.answer(user_input)
        except akinator.InvalidChoiceError:
            print("Resposta inválida. Tente novamente.")

print("\n--- Fim de jogo ---")
print(f"Chute: {aki.name_proposition}")
print(f"Descrição: {aki.description_proposition}")
print(f"Pseudo: {aki.pseudo}")
print(f"Foto: {aki.photo}")
print(f"O gênio diz: {aki.question}")